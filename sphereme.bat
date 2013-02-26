@echo off

echo Generates spheres on Raspberry Pi edition

set raspiconnection=localhost

set tempfile=raspi_temp_temp.txt

rem set material=1
rem set materialdata=0

del %tempfile%

if not exist %windir%\system32\telnet.exe goto checkPutty
set telnettype=sendviatelnet
goto donecheck
:checkPutty
if not exist plink.exe goto installTelnet
set telnettype=sendviaputty
:donecheck

:buildanothersphere
set /p sphereX=Sphere X:
set /p sphereY=Sphere Y:
set /p sphereZ=Sphere Z:
set /p radius=Sphere radius:
set /p material=Material:
set /p materialdata=Material data:
rem set sphereX=5
rem set sphereY=5
rem set sphereZ=5
rem set radius=5

set returnfunc=doneonesphere

goto buildsphereloop

:doneonesphere
set /p useranswer=Build another? y/n: 
if %useranswer%==n goto doneallspheres
goto buildanothersphere

:doneallspheres
goto %telnettype%
:sendviatelnet
telnet %raspiconnection% 4711 <%tempfile%
pause
exit
:sendviaputty
plink -P 4711 -raw %raspiconnection% <%tempfile%
pause
exit
pause
exit

:buildsphereloop
rem params:
rem sphereX = sphere's x centre
rem sphereY = sphere's y centre
rem sphereZ = sphere's z centre
rem material = item ID of the material
rem radius = radius of sphere
set /a rminusone=%radius%-1
set /a x=-%radius%
set /a rr=%radius%*%radius%

:sphereXloop
set /a y=-%radius%

:sphereYloop
set /a z=-%radius%

:sphereZloop
set /a rrr=(%x%*%x%)+(%y%*%y%)+(%z%*%z%)
if %rrr% gtr %rr% goto dontzloop

set /a xx=%x%+%sphereX%
set /a yy=%y%+%sphereY%
set /a zz=%z%+%sphereZ%

echo world.setBlock(%xx%,%yy%,%zz%,%material%,%materialdata%) >>%tempfile%
rem echo chat.post(%xx% %yy% %zz% %material% %materialdata%) >> %tempfile%
:dontzloop
set /a z=%z%+1
if %z%==%radius% goto donezloop
goto sphereZloop
:donezloop
set /a y=%y%+1
if %y%==%radius% goto doneyloop
goto sphereYloop
:doneyloop
set /a x=%x%+1
if %x%==%radius% goto donexloop
goto sphereXloop
:donexloop
goto returnplz
:returnplz
goto %returnfunc%

:installTelnet
echo You seem to be running this script on a Windows 7 or 8 machine.
echo Please install Telnet or Plink before running this script.
echo See the thread for instructions.
pause
exit
