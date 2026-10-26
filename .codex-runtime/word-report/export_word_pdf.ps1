param([string]$InputDocx,[string]$OutputPdf)
$ErrorActionPreference = 'Stop'
$wordApp = $null
$document = $null
try {
    $wordApp = New-Object -ComObject Word.Application
    $wordApp.Visible = $false
    $wordApp.DisplayAlerts = 0
    $document = $wordApp.Documents.Open($InputDocx, $false, $false)
    $document.Repaginate()
    $document.Fields.Update() | Out-Null
    foreach ($toc in $document.TablesOfContents) { $toc.Update() }
    $document.Repaginate()
    $document.Fields.Update() | Out-Null
    $document.Save()
    $document.ExportAsFixedFormat($OutputPdf, 17)
    Write-Output ('Native Word PDF exported: ' + $OutputPdf)
} finally {
    if ($null -ne $document) { $document.Close(0); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null }
    if ($null -ne $wordApp) { $wordApp.Quit(); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wordApp) | Out-Null }
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
