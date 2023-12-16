#!/bin/bash

pushd converter
py -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
py converter.py
deactivate
popd
