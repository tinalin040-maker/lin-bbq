param([int]$Port = 0)
if ($Port -eq 0) {
    $Port = if ($env:PORT) { [int]$env:PORT } else { 3000 }
}

$root = "C:\Users\tinal\OneDrive\桌面\claude\林燒烤"
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Serving http://localhost:$Port/ from $root"

try {
    while ($listener.IsListening) {
        $ctx  = $listener.GetContext()
        $req  = $ctx.Request
        $resp = $ctx.Response

        $urlPath = $req.Url.LocalPath
        if ($urlPath -eq "/") { $urlPath = "/index.html" }
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        $filePath = Join-Path $root ($urlPath.TrimStart("/").Replace("/", "\"))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".png"  { "image/png" }
                ".svg"  { "image/svg+xml" }
                ".ico"  { "image/x-icon" }
                ".json" { "application/json" }
                default { "application/octet-stream" }
            }
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $resp.ContentType     = $mime
            $resp.ContentLength64 = $bytes.Length
            $resp.StatusCode      = 200
            $resp.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $resp.StatusCode      = 404
            $resp.ContentType     = "text/plain"
            $resp.ContentLength64 = $msg.Length
            $resp.OutputStream.Write($msg, 0, $msg.Length)
        }
        $resp.OutputStream.Close()
    }
} finally {
    $listener.Stop()
}
