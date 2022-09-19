
Param
(
    [Parameter(Mandatory=$false)][string]$PAT ="qsstx2t4jhwavexr3kgl5jy7ilkno33ggzg7soxfkubbckn4fj3a",
    [Parameter(Mandatory=$false)][string]$Organization="KorTerra",
    [Parameter(Mandatory=$false)][string]$ProjectName= "KorWeb%20Companion",
    [Parameter(Mandatory=$false)][string]$PackageName= "staging-desktop"
)

$AzureDevOpsAuthenicationHeader = @{Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes(":$($PAT)")) }
$UriRootFeeds = "https://feeds.dev.azure.com/$($Organization)/"

$ProjectFeeds = "$($UriRootFeeds)/$($FeedProjectName)/_apis/packaging/feeds?api-version=6.0-preview.1"
#Write-Host($ProjectFeeds)

$FeedResult = Invoke-RestMethod -Uri $ProjectFeeds -Method get -Headers $AzureDevOpsAuthenicationHeader
[string]$FeedVersions = ""

Foreach ($feed in $FeedResult.value)
{
    #Write-Host($feed.name)
    
    $UriFeedPackages = $UriRootFeeds + "$($FeedProjectName)/_apis/packaging/Feeds/$($feed.id)/packages?api-version=6.0-preview.1"
    $FeedPackageResult = Invoke-RestMethod -Uri $UriFeedPackages -Method get -Headers $AzureDevOpsAuthenicationHeader
    
    Foreach ($feedpackage in $FeedPackageResult.value){
        if($feedpackage.name -eq $PackageName){
            #Write-Host($feedpackage.name)
            $UriFeedPackageVersion = $UriRootFeeds + "$($FeedProjectName)/_apis/packaging/Feeds/$($feed.id)/Packages/$($feedpackage.id)/versions?api-version=6.0-preview.1"
            #Write-Host($UriFeedPackageVersion)

            $FeedPackageVersionResult = Invoke-RestMethod -Uri $UriFeedPackageVersion -Method get -Headers $AzureDevOpsAuthenicationHeader
            Foreach($version in $FeedPackageVersionResult.value){
                $FeedVersions = ([string]($version.version).Trim()), $FeedVersions -join(' ')
            }
        }   
    }
}

$FeedVersions.GetType()
Write-Output($FeedVersions)

$VersionArray = $FeedVersions -split " "
$VersionArray.GetType()

$SortVersionArray = @(0..$($VersionArray.Length-2))

$i = 0
while($i -lt $SortVersionArray.Length){
    
    $SortVersionArray[$i] = New-Object System.Version($VersionArray[$i])
    $i ++
}

$SortVersionArray= ($SortVersionArray | Sort-Object -Descending)

$lastVer= $SortVersionArray[0].ToString()

Write-Host "##vso[task.setvariable variable=LastVersion;]$lastVer"
Write-Host "Last Version Published to Package Feed: v$lastVer"



