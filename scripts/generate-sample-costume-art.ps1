param(
  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory
)

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OutputDirectory "assets") | Out-Null

function New-Canvas([int]$Width, [int]$Height) {
  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $graphics.Clear([System.Drawing.Color]::Transparent)
  return @($bitmap, $graphics)
}

function Save-Overlay([string]$Path, [string]$View) {
  $canvas = New-Canvas 128 128
  $bitmap = $canvas[0]
  $graphics = $canvas[1]
  $teal = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 73, 135, 134))
  $cream = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 231, 220, 196))
  $rust = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 205, 105, 67))
  $ink = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(245, 45, 54, 56), 4)
  $shine = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 155, 224, 202))

  if ($View -eq "front") {
    $graphics.FillEllipse($cream, 42, 50, 44, 18)
    $graphics.FillRectangle($teal, 42, 61, 44, 46)
    $graphics.DrawRectangle($ink, 42, 61, 44, 46)
    $graphics.FillEllipse($rust, 53, 70, 22, 22)
    $graphics.FillEllipse($shine, 59, 76, 10, 10)
    $graphics.FillRectangle($cream, 47, 105, 12, 12)
    $graphics.FillRectangle($cream, 69, 105, 12, 12)
  } elseif ($View -eq "side") {
    $graphics.FillEllipse($cream, 45, 52, 39, 16)
    $graphics.FillRectangle($teal, 39, 64, 50, 39)
    $graphics.DrawRectangle($ink, 39, 64, 50, 39)
    $graphics.FillEllipse($rust, 66, 72, 17, 17)
    $graphics.FillRectangle($cream, 47, 102, 12, 14)
    $graphics.FillRectangle($cream, 73, 102, 12, 14)
  } else {
    $graphics.FillEllipse($cream, 42, 50, 44, 18)
    $graphics.FillRectangle($teal, 42, 61, 44, 46)
    $graphics.DrawRectangle($ink, 42, 61, 44, 46)
    $graphics.FillRectangle($rust, 59, 66, 10, 34)
    $graphics.FillRectangle($cream, 47, 105, 12, 12)
    $graphics.FillRectangle($cream, 69, 105, 12, 12)
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $ink.Dispose()
  $teal.Dispose()
  $cream.Dispose()
  $rust.Dispose()
  $shine.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-Overlay (Join-Path $OutputDirectory "assets\body-front.png") "front"
Save-Overlay (Join-Path $OutputDirectory "assets\body-side.png") "side"
Save-Overlay (Join-Path $OutputDirectory "assets\body-back.png") "back"

foreach ($previewName in @("thumbnail.png", "preview.png")) {
  $size = if ($previewName -eq "thumbnail.png") { 256 } else { 640 }
  $canvas = New-Canvas $size $size
  $bitmap = $canvas[0]
  $graphics = $canvas[1]
  $graphics.Clear([System.Drawing.Color]::FromArgb(255, 233, 220, 195))
  $panel = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 73, 135, 134))
  $rust = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 205, 105, 67))
  $cream = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 246, 235, 214))
  $graphics.FillEllipse($cream, [int]($size * .24), [int]($size * .13), [int]($size * .52), [int]($size * .52))
  $graphics.FillRectangle($panel, [int]($size * .27), [int]($size * .45), [int]($size * .46), [int]($size * .38))
  $graphics.FillEllipse($rust, [int]($size * .39), [int]($size * .52), [int]($size * .22), [int]($size * .22))
  $bitmap.Save((Join-Path $OutputDirectory $previewName), [System.Drawing.Imaging.ImageFormat]::Png)
  $panel.Dispose()
  $rust.Dispose()
  $cream.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
