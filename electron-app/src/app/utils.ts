export function isWindows(): boolean {
  return process.platform === 'win32';
}

export function isOSX(): boolean {
  return process.platform === 'darwin';
}

export function isLinux(): boolean {
  return !(isWindows() || isOSX());
}

export function getBaseE621Url() {
  return process.env.E621_BASE_URL ?? 'http://192.168.0.113';
}
