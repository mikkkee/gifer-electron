#!/usr/bin/env bash
electron-packager . gifer-electron --platform=darwin --arch=x64 --out=./build --ignore=./build --overwrite --icon=./resources/logo_icon.ico
