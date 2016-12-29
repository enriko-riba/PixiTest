
cd %1
for /R %%f in (*.png) do magick convert "%%f" -alpha set -write mpr:temp -background black -alpha Remove mpr:temp -compose Copy_Opacity -composite "..\_distribute\%%~nf%%~xf" 
rem magick convert "%%f" -alpha set -write mpr:temp -background black -alpha Remove mpr:temp -compose Copy_Opacity -composite "%%~nf_pre%%~xf" 