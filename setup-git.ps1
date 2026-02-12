# Script per caricare il bot su GitHub
# Sostituisci URL_DEL_TUO_REPOS con l'indirizzo del tuo repository GitHub

git init
git add .
git commit -m "Initial commit - Crypto Nexus Bot"
git branch -M main
# git remote add origin URL_DEL_TUO_REPOS
# git push -u origin main

Write-Host "Inizializzazione completata!" -ForegroundColor Cyan
Write-Host "Ora esegui questi due comandi (sostituendo l'URL):" -ForegroundColor White
Write-Host "1. git remote add origin https://github.com/TUO_UTENTE/NOME_REPO.git"
Write-Host "2. git push -u origin main"
