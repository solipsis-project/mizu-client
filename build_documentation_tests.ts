// This file autogenerates tests from the documentation examples, to ensure that the documented behavior matches the observed behavior.

import fs, { ReadStream, WriteStream } from 'fs';
import os from 'os';
import readline from 'readline';
import fsp from 'fs/promises';

const pages = [
    "mizu-documentation/pages/tutorial"
]

const PROMPT_PREFIX = ">";
const BLOCK_PREFIX = "```";
const TEST_CASE_PREFIX = "[test]: #";
const RESULT_VARIABLE_NAME = "CITestResult" // chosen to be unlikely to collide with variables used in the examples.

const PREAMBLE = '\
Param(\n\
    [Parameter(Position=0)]\n\
    [string[]]\n\
    $TestFlags\n\
)\n\
$EnabledTests = New-Object System.Collections.Generic.List[string]\n\
$DisabledTests = New-Object System.Collections.Generic.List[string]\n\
$RunUnnamedTests = $true\n\
\n\
foreach ($TestFlag in $TestFlags)\n\
{\n\
    if ($TestFlag.substring(0, 1) -eq "!") {\n\
        $DisabledTests.Add($TestFlag.substring(1))\n\
        $RunUnnamedTests = $true\n\
    } else {\n\
        $EnabledTests.Add($TestFlag)\n\
        $RunUnnamedTests = $false\n\
    }\n\
}\n\
$FailedTests = 0\n\
$PassedTests = 0\n\
$SkippedTests = 0\n\
$TotalTests = 0\n\
';

const SUCCESS_TEMPLATE = (testName: string) => `\
\t\techo "Passed: ${testName}"\n\
\t\t$PassedTests++\n\
\t\t$TotalTests++\n\
`;

const SKIPPED_TEMPLATE = (testName: string) => `\
\t\techo "Skipping ${testName}"\n\
\t\t$SkippedTests++\n\
\t\t$TotalTests++\n\
`;

const FAILURE_TEMPLATE = (testName: string, errorMessage: string) => `\
\t\techo "Failed: ${testName}"\n\
\t\techo "${errorMessage}"\n\
\t\t$FailedTests++\n\
\t\t$TotalTests++\
`;

const POSTAMBLE = (inputPath: string) => ` \
if ($FailedTests -gt 0) {\n\
    throw "$SkippedTests skipped, $PassedTests passed, $FailedTests failed in ${inputPath}; see above for more information."\n\
} else {\n\
    echo "$SkippedTests skipped, $PassedTests passed in ${inputPath}."\n\
}\
`;

/*
Scan each file, looking for codeblocks preceeded by the following link label:
[test]: # (test_name)
In the following code block, each line that begins with a '>' is interpreted as a command.
Each line that doesn't begin with a '>' is interpreted as an expected response.

*/

type State = "awaiting_comment"
    | "awaiting_block_start"
    | "parsing_command"
    | "parsing_response";

async function parseInputFile(inputPath: string, outputPath: string) {
    var output = await fsp.open(outputPath, "w");
    await output.write(PREAMBLE);
    const lines = readline.createInterface(fs.createReadStream(inputPath));
    var state: State = "awaiting_comment";
    var lineNumber = 0;
    var buffer = "";
    var test_name = "";
    for await (const line of lines) {
        lineNumber++;
        if (state == "awaiting_comment") {
            if (line.startsWith(TEST_CASE_PREFIX)) {
                state = "awaiting_block_start";
                const start_index = line.indexOf('(')
                if (start_index == -1) {
                    continue;
                }
                const end_index = line.indexOf(')')
                test_name = line.substring(start_index + 1, end_index)
                const test_name_prefix = (test_name == "") ? "($RunUnnamedTests)" : `(($EnabledTests -Contains "${test_name}") -Or ( $RunUnnamedTests -And (-Not ($DisabledTests -Contains "${test_name}"))))`
                await output.write(`if ( -Not ${test_name_prefix}) {\n${SKIPPED_TEMPLATE(test_name)}} else {\n`)
            }
            continue;
        } else if (state == "awaiting_block_start") {
            if (!line.startsWith(BLOCK_PREFIX)) {
                throw `Epected start of block, found ${line}`;
            }
            state = "parsing_command";
            continue;
        }
        const is_block_end = line.startsWith(BLOCK_PREFIX);
        const is_command_start = line.startsWith(PROMPT_PREFIX);
        // Is this line a continuation of a multiline statement?
        const is_multiline = !is_block_end && !is_command_start && (
            (state == "parsing_command" && (line.length > 0 && line[0] == ' ' || line[0] == '\t'))
            || (state == "parsing_response"));
        if (!is_multiline) { // Flush the buffer before processing the next line.
            if (buffer != '') {
                if (state == "parsing_command") {
                    await output.write(`\t$${RESULT_VARIABLE_NAME} = (${buffer})\n`);
                } else {
                    const error_message = `Unexpected result in ${inputPath}, line ${lineNumber}: expected '${buffer}', got $${RESULT_VARIABLE_NAME}}`;
                    await output.write(`\tif ($${RESULT_VARIABLE_NAME} -ne '${buffer}') \n{\n${FAILURE_TEMPLATE(test_name, error_message)}\n}\nelse\n{\n${SUCCESS_TEMPLATE(test_name)}}\n`);
                }
                buffer = '';
            }
            if (is_block_end) {
                await output.write('}\n')
                test_name = "";
                state = "awaiting_comment";
                continue;
            }
            if (is_command_start) {
                state = "parsing_command";
                buffer = line.substring(1);
            } else {
                state = "parsing_response";
                buffer = line;
            }
        } else if (state == "parsing_command") {
            buffer += "\n\t" + line;
        } else if (state == "parsing_response") {
            // Escape single quotes in the expected output.
            buffer += "\n" + line.replace(/'/g, "''");
        }
    }
    if (state != "awaiting_comment") {
        throw 'Unexpected end of file';
    }
    await output.write(POSTAMBLE(inputPath));
}

function getDirectory(filePath: string) {
    const endIndex = filePath.lastIndexOf('/');
    return filePath.substring(0, endIndex);
}

async function generateTests() {
    for (const page of pages) {
        const output_dir = getDirectory(`./tests/generated/${page}`);
        if (!fs.existsSync(output_dir)) {
            fs.mkdirSync(output_dir, { recursive: true });
        }
        await parseInputFile(`${page}.md`, `./tests/generated/${page}.ps1`);
    }
}

generateTests();