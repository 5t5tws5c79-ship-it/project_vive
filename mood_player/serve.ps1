# 무드 플레이어 검증용 로컬 서버 (Node 불필요)
# - mood_player 폴더를 http://localhost:8000 로 서빙
# - /config.js 요청 시 ../.env 의 API_KEY 를 window.OPENAI_KEY 로 주입(디스크에 안 씀)
# 실행:  powershell -ExecutionPolicy Bypass -File serve.ps1
# 중지:  이 창에서 Ctrl+C

$root    = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path (Split-Path -Parent $root) ".env"
$port    = 8000

$mime = @{
  ".html"="text/html; charset=utf-8"; ".js"="text/javascript; charset=utf-8"
  ".json"="application/json; charset=utf-8"; ".css"="text/css; charset=utf-8"
  ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".ico"="image/x-icon"
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Write-Host "serving  $root"
Write-Host "open ->  http://localhost:$port/demo.html   (Ctrl+C to stop)"

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reqLine = $reader.ReadLine()
    while (($h = $reader.ReadLine()) -ne "" -and $h -ne $null) { }   # 헤더 소비
    if (-not $reqLine) { $client.Close(); continue }

    $rawPath = ($reqLine -split ' ')[1]
    $path = [System.Uri]::UnescapeDataString((($rawPath -split '\?')[0]))
    if ($path -eq "/") { $path = "/demo.html" }

    $bytes = $null; $ctype = "application/octet-stream"; $status = "200 OK"

    if ($path -eq "/config.js") {
      $key = ""
      if (Test-Path $envFile) {
        # Vue(Vite)와 동일하게 VITE_OPENAI_API_KEY 우선, 없으면 API_KEY 폴백
        $line = Get-Content $envFile | Where-Object { $_ -match '^(VITE_OPENAI_API_KEY|API_KEY)=' } | Select-Object -First 1
        $key = ($line -replace '^(VITE_OPENAI_API_KEY|API_KEY)=','').Trim()
      }
      $js = "window.OPENAI_KEY = " + ($key | ConvertTo-Json) + ";"
      $bytes = [System.Text.Encoding]::UTF8.GetBytes($js)
      $ctype = "text/javascript; charset=utf-8"
    }
    else {
      $file = Join-Path $root ($path.TrimStart("/"))
      if (Test-Path $file -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        if ($mime.ContainsKey($ext)) { $ctype = $mime[$ext] }
      } else {
        $status = "404 Not Found"; $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 $path")
        $ctype = "text/plain; charset=utf-8"
      }
    }

    $head = "HTTP/1.1 $status`r`nContent-Type: $ctype`r`nContent-Length: $($bytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
    $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
    $stream.Write($hb, 0, $hb.Length)
    $stream.Write($bytes, 0, $bytes.Length)
    $stream.Flush()
  } catch {
    Write-Host "req error: $($_.Exception.Message)"
  } finally {
    $client.Close()
  }
}
