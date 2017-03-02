
cd %1
for /R %%f in (*.png) do magick convert "%%f" -alpha set -write mpr:temp -background black -alpha Remove mpr:temp -compose Copy_Opacity -composite "..\_distribute\%%~nf%%~xf" 
rem for /R %%f in (*.png) do xcopy "%%f" "..\_distribute\%%~nf%%~xf" /y
