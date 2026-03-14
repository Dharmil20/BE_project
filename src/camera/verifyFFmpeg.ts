/**
 * Verify FFmpeg is installed and return version string.
 */

export async function checkFFmpeg(): Promise<{
  available: boolean;
  version: string;
}> {
  try {
    const proc = Bun.spawn(["ffmpeg", "-version"], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    await proc.exited;
    const out = stdout || stderr;
    // First line usually: "ffmpeg version 6.0 Copyright ..." or "ffmpeg version n6.0-..."
    const match = out.match(/ffmpeg version ([^\s]+)/i);
    const version = match ? match[1].trim() : out.split("\n")[0]?.trim() || "unknown";
    return { available: proc.exitCode === 0, version };
  } catch {
    return { available: false, version: "" };
  }
}
