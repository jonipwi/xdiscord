git init

# Prefer environment variables for CI/automation: GITHUB_TOKEN or GH_TOKEN
$Token = $env:XDISCORD_GITHUB_TOKEN
if (-not $Token) {
	$Token = $env:GH_TOKEN
}

# Fallback to legacy token file in the user's home directory if env vars not set
if (-not $Token) {
	$tokenPath = Join-Path $env:USERPROFILE '.github_token'
	if (Test-Path $tokenPath) {
		try {
			$Token = (Get-Content -Path $tokenPath -ErrorAction Stop) -join "" | ForEach-Object { $_.Trim() }
		} catch {
			# Use a formatted string to avoid PowerShell interpreting the ':' after the variable as part of a variable reference
			Write-Warning ("Could not read token file at {0}: {1}" -f $tokenPath, $_)
		}
	}
}

# If still no token, prompt the user (securely) so script can be used interactively
if (-not $Token) {
	Write-Host "GitHub token not found in environment or ~/.github_token. You can set the XDISCORD_GITHUB_TOKEN env var to avoid this prompt." -ForegroundColor Yellow
	$secureToken = Read-Host -AsSecureString "Enter GitHub personal access token (input hidden)"
	# Convert SecureString to plain text for validation and use
	$Ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
	try {
		$plainToken = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($Ptr)
	} finally {
		[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Ptr)
	}
	if ([string]::IsNullOrWhiteSpace($plainToken)) {
		Write-Error "No token provided. Aborting remote setup."
		exit 1
	}
	$Token = $plainToken
}

if (-not $Token) {
	Write-Error "GitHub token unavailable. Cannot add remote."
	exit 1
}

# Add remote using token (note: embedding token in remote URL stores it in git config; prefer using Git credential helpers)
$remoteUrl = "https://jonipwi:$Token@github.com/jonipwi/xdiscord.git"

# If origin exists, update its URL; otherwise add it. This avoids duplicate remote errors.
try {
	git remote get-url origin > $null 2>&1
	if ($LASTEXITCODE -eq 0) {
		git remote set-url origin $remoteUrl
	} else {
		git remote add origin $remoteUrl
	}
} catch {
	# Fallback: attempt to add remote
	git remote add origin $remoteUrl
}
