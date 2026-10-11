# Respaldo de repos de GitHub (IscoSanchezL) en tu carpeta 0PROYECTOS de Drive (Windows).
# Uso:  .\respaldo-repos.ps1 -Destino "G:\Mi unidad\0PROYECTOS"
# Si el repo no está lo clona; si está atrasado lo actualiza; si está al día no hace nada.
# Requiere git. Para repos privados: instala GitHub CLI y ejecuta antes  gh auth login
param([Parameter(Mandatory = $true)][string]$Destino)

$usuario = 'IscoSanchezL'
$repos = @('Kody','teclea-respaldos','beto-algoritmos','iscosanchezl','Teclea','classdrive',
  'Laboratorio-anti-phishing','Goldberg-Machine','Puzzles','Typing','partes-del-computador',
  'Detectives-de-Carpetas','Proyecto_Paint_2do','Correos4to','techstore','rednexo','plannergi')
# Carpeta de Drive donde vive cada repo (los demás usan su propio nombre)
$carpetas = @{ 'Kody' = 'Kody'; 'classdrive' = 'ClassDrive'; 'beto-algoritmos' = 'ALGORITMOS';
  'techstore' = 'TechStore'; 'rednexo' = 'RedNexo' }

foreach ($r in $repos) {
  $c = if ($carpetas.ContainsKey($r)) { $carpetas[$r] } else { $r }
  $base = Join-Path $Destino $c
  New-Item -ItemType Directory -Force -Path $base | Out-Null
  $dir = Join-Path $base $r
  if (Test-Path (Join-Path $dir '.git')) {
    git -C $dir fetch -q origin
    if ($LASTEXITCODE -ne 0) { Write-Host "X $r (no se pudo consultar GitHub)"; continue }
    $local = git -C $dir rev-parse HEAD
    $remoto = git -C $dir rev-parse '@{u}' 2>$null
    if ($local -eq $remoto) { Write-Host "OK $r ya esta al dia" }
    else {
      git -C $dir pull -q --ff-only
      if ($LASTEXITCODE -eq 0) { Write-Host "ACTUALIZADO $r" } else { Write-Host "X $r tiene cambios locales: revisalo a mano" }
    }
  }
  else {
    git clone -q "https://github.com/$usuario/$r.git" $dir
    if ($LASTEXITCODE -eq 0) { Write-Host "DESCARGADO $r" } else { Write-Host "X $r no se pudo descargar (es privado? ejecuta: gh auth login)" }
  }
}
Write-Host 'Listo.'
