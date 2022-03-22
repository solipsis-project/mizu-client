export default function normalizePath(path : string) {
    // remove slashes at the end.
    path = path.replace(/\/+/, '/');
    // remove multiple consecutive slashes
    path = path.replace(/\/$/, '');
    return path;
}