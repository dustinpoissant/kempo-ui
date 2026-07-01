Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$url = 'http://localhost:8083/components/video.html#normal'
Start-Process -FilePath 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe' -ArgumentList $url
Start-Sleep -Seconds 7

# Take screenshot of full screen
$screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
$bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
$bitmap.Save('C:\Users\dusti\dev\kempo-ui\final-screenshot.png')
$graphics.Dispose()
$bitmap.Dispose()

taskkill /F /IM msedge.exe 2>$null
