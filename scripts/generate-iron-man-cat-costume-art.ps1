param(
  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory,
  [Parameter(Mandatory = $true)]
  [string]$MarketingImage
)

Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $OutputDirectory "assets") | Out-Null

function New-Canvas([int]$Width, [int]$Height) {
  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.Clear([System.Drawing.Color]::Transparent)
  return @($bitmap, $graphics)
}

function New-Points([int[][]]$Coordinates) {
  [System.Drawing.Point[]]$points = $Coordinates | ForEach-Object {
    New-Object System.Drawing.Point($_[0], $_[1])
  }
  return $points
}

function Save-Front([string]$Path, [string]$State) {
  $canvas = New-Canvas 128 128
  $bitmap = $canvas[0]
  $g = $canvas[1]
  $red = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(246, 171, 38, 38))
  $redDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 91, 24, 31))
  $gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(252, 239, 177, 55))
  $goldLight = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(252, 255, 218, 103))
  $joint = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(242, 56, 31, 35))
  $cyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 99, 231, 255))
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 255, 255))
  $outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(250, 51, 25, 29), 3)
  $cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(238, 81, 219, 255), 5)

  # Torso and articulated limbs.
  $g.FillPolygon($red, (New-Points @(@(38, 56), @(48, 51), @(80, 51), @(90, 56), @(86, 101), @(75, 111), @(53, 111), @(42, 101))))
  $g.DrawPolygon($outline, (New-Points @(@(38, 56), @(48, 51), @(80, 51), @(90, 56), @(86, 101), @(75, 111), @(53, 111), @(42, 101))))
  $g.FillRectangle($gold, 42, 64, 10, 29)
  $g.FillRectangle($gold, 76, 64, 10, 29)
  $g.FillRectangle($redDark, 52, 58, 24, 9)
  $g.FillEllipse($gold, 54, 69, 20, 20)
  $g.FillEllipse($cyan, 58, 73, 12, 12)
  $g.FillEllipse($white, 61, 76, 6, 6)
  $g.FillRectangle($joint, 44, 96, 15, 9)
  $g.FillRectangle($joint, 69, 96, 15, 9)
  $g.FillRectangle($red, 42, 104, 18, 13)
  $g.FillRectangle($red, 68, 104, 18, 13)
  $g.FillRectangle($goldLight, 43, 113, 17, 6)
  $g.FillRectangle($goldLight, 68, 113, 17, 6)

  # Helmet, either shut over the base cat face or hinged above it.
  if ($State -eq "open") {
    $g.FillPolygon($red, (New-Points @(@(42, 29), @(46, 10), @(55, 22), @(73, 22), @(82, 10), @(86, 29), @(78, 34), @(50, 34))))
    $g.DrawPolygon($outline, (New-Points @(@(42, 29), @(46, 10), @(55, 22), @(73, 22), @(82, 10), @(86, 29), @(78, 34), @(50, 34))))
    $g.FillPolygon($gold, (New-Points @(@(49, 8), @(79, 8), @(83, 28), @(74, 34), @(54, 34), @(45, 28))))
    $g.DrawPolygon($outline, (New-Points @(@(49, 8), @(79, 8), @(83, 28), @(74, 34), @(54, 34), @(45, 28))))
    $g.FillRectangle($redDark, 39, 35, 8, 24)
    $g.FillRectangle($redDark, 81, 35, 8, 24)
    $g.FillRectangle($gold, 42, 55, 8, 7)
    $g.FillRectangle($gold, 78, 55, 8, 7)
  } else {
    $g.FillPolygon($red, (New-Points @(@(39, 45), @(44, 17), @(54, 29), @(74, 29), @(84, 17), @(89, 45), @(83, 62), @(45, 62))))
    $g.DrawPolygon($outline, (New-Points @(@(39, 45), @(44, 17), @(54, 29), @(74, 29), @(84, 17), @(89, 45), @(83, 62), @(45, 62))))
    $g.FillPolygon($gold, (New-Points @(@(46, 31), @(55, 25), @(73, 25), @(82, 31), @(79, 57), @(70, 63), @(58, 63), @(49, 57))))
    $g.DrawPolygon($outline, (New-Points @(@(46, 31), @(55, 25), @(73, 25), @(82, 31), @(79, 57), @(70, 63), @(58, 63), @(49, 57))))
    if ($State -eq "glow") {
      $g.DrawLine($cyanPen, 50, 43, 60, 45)
      $g.DrawLine($cyanPen, 68, 45, 78, 43)
    }
    $g.FillPolygon($cyan, (New-Points @(@(49, 41), @(61, 43), @(59, 48), @(50, 46))))
    $g.FillPolygon($cyan, (New-Points @(@(67, 43), @(79, 41), @(78, 46), @(69, 48))))
    if ($State -eq "glow") {
      $g.FillPolygon($white, (New-Points @(@(51, 42), @(60, 44), @(58, 46), @(51, 45))))
      $g.FillPolygon($white, (New-Points @(@(68, 44), @(77, 42), @(77, 45), @(70, 46))))
    }
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  foreach ($resource in @($red, $redDark, $gold, $goldLight, $joint, $cyan, $white, $outline, $cyanPen, $g, $bitmap)) {
    $resource.Dispose()
  }
}

function Save-Side([string]$Path, [string]$State) {
  $canvas = New-Canvas 128 128
  $bitmap = $canvas[0]
  $g = $canvas[1]
  $red = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(246, 171, 38, 38))
  $redDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 91, 24, 31))
  $gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(252, 239, 177, 55))
  $cyan = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 99, 231, 255))
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 255, 255))
  $outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(250, 51, 25, 29), 3)
  $cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(238, 81, 219, 255), 5)

  $g.FillPolygon($red, (New-Points @(@(35, 61), @(48, 53), @(82, 55), @(92, 67), @(88, 103), @(47, 107), @(37, 94))))
  $g.DrawPolygon($outline, (New-Points @(@(35, 61), @(48, 53), @(82, 55), @(92, 67), @(88, 103), @(47, 107), @(37, 94))))
  $g.FillRectangle($gold, 43, 64, 10, 31)
  $g.FillEllipse($gold, 70, 69, 18, 18)
  $g.FillEllipse($cyan, 75, 74, 9, 9)
  $g.FillRectangle($redDark, 48, 99, 14, 8)
  $g.FillRectangle($redDark, 74, 99, 14, 8)
  $g.FillRectangle($red, 46, 105, 17, 12)
  $g.FillRectangle($red, 72, 105, 17, 12)
  $g.FillRectangle($gold, 47, 113, 16, 6)
  $g.FillRectangle($gold, 72, 113, 16, 6)

  if ($State -eq "open") {
    $g.FillPolygon($red, (New-Points @(@(44, 30), @(50, 11), @(59, 25), @(78, 22), @(84, 33), @(73, 37), @(51, 36))))
    $g.DrawPolygon($outline, (New-Points @(@(44, 30), @(50, 11), @(59, 25), @(78, 22), @(84, 33), @(73, 37), @(51, 36))))
    $g.FillPolygon($gold, (New-Points @(@(53, 10), @(79, 20), @(80, 31), @(70, 36), @(51, 29))))
    $g.DrawPolygon($outline, (New-Points @(@(53, 10), @(79, 20), @(80, 31), @(70, 36), @(51, 29))))
    $g.FillRectangle($redDark, 43, 36, 8, 24)
    $g.FillRectangle($gold, 47, 56, 12, 6)
  } else {
    $g.FillPolygon($red, (New-Points @(@(42, 45), @(48, 18), @(59, 30), @(78, 28), @(88, 39), @(82, 61), @(49, 63))))
    $g.DrawPolygon($outline, (New-Points @(@(42, 45), @(48, 18), @(59, 30), @(78, 28), @(88, 39), @(82, 61), @(49, 63))))
    $g.FillPolygon($gold, (New-Points @(@(52, 31), @(75, 30), @(84, 39), @(78, 58), @(54, 59), @(48, 48))))
    $g.DrawPolygon($outline, (New-Points @(@(52, 31), @(75, 30), @(84, 39), @(78, 58), @(54, 59), @(48, 48))))
    if ($State -eq "glow") {
      $g.DrawLine($cyanPen, 68, 42, 81, 43)
    }
    $g.FillPolygon($cyan, (New-Points @(@(67, 40), @(82, 41), @(80, 47), @(69, 46))))
    if ($State -eq "glow") {
      $g.FillPolygon($white, (New-Points @(@(69, 41), @(80, 42), @(79, 45), @(70, 44))))
    }
  }

  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  foreach ($resource in @($red, $redDark, $gold, $cyan, $white, $outline, $cyanPen, $g, $bitmap)) {
    $resource.Dispose()
  }
}

function Save-Back([string]$Path) {
  $canvas = New-Canvas 128 128
  $bitmap = $canvas[0]
  $g = $canvas[1]
  $red = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(246, 171, 38, 38))
  $redDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 91, 24, 31))
  $gold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(252, 239, 177, 55))
  $outline = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(250, 51, 25, 29), 3)
  $g.FillPolygon($red, (New-Points @(@(39, 44), @(44, 17), @(55, 30), @(73, 30), @(84, 17), @(89, 44), @(84, 61), @(44, 61))))
  $g.DrawPolygon($outline, (New-Points @(@(39, 44), @(44, 17), @(55, 30), @(73, 30), @(84, 17), @(89, 44), @(84, 61), @(44, 61))))
  $g.FillPolygon($red, (New-Points @(@(38, 57), @(49, 51), @(79, 51), @(90, 57), @(86, 104), @(75, 112), @(53, 112), @(42, 104))))
  $g.DrawPolygon($outline, (New-Points @(@(38, 57), @(49, 51), @(79, 51), @(90, 57), @(86, 104), @(75, 112), @(53, 112), @(42, 104))))
  $g.FillRectangle($gold, 59, 65, 10, 34)
  $g.FillRectangle($redDark, 48, 72, 32, 8)
  $g.FillRectangle($gold, 43, 107, 17, 10)
  $g.FillRectangle($gold, 68, 107, 17, 10)
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  foreach ($resource in @($red, $redDark, $gold, $outline, $g, $bitmap)) {
    $resource.Dispose()
  }
}

Save-Front (Join-Path $OutputDirectory "assets\body-front.png") "base"
Save-Front (Join-Path $OutputDirectory "assets\body-front-open.png") "open"
Save-Front (Join-Path $OutputDirectory "assets\body-front-glow.png") "glow"
Save-Side (Join-Path $OutputDirectory "assets\body-side.png") "base"
Save-Side (Join-Path $OutputDirectory "assets\body-side-open.png") "open"
Save-Side (Join-Path $OutputDirectory "assets\body-side-glow.png") "glow"
Save-Back (Join-Path $OutputDirectory "assets\body-back.png")

Copy-Item -LiteralPath $MarketingImage -Destination (Join-Path $OutputDirectory "preview.png") -Force
$source = [System.Drawing.Image]::FromFile($MarketingImage)
$thumb = New-Object System.Drawing.Bitmap(256, 256, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$thumbGraphics = [System.Drawing.Graphics]::FromImage($thumb)
$thumbGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$thumbGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$thumbGraphics.Clear([System.Drawing.Color]::Transparent)
$thumbGraphics.DrawImage($source, 0, 0, 256, 256)
$thumb.Save((Join-Path $OutputDirectory "thumbnail.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$thumbGraphics.Dispose()
$thumb.Dispose()
$source.Dispose()
