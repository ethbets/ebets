#!/usr/bin/env bash
year=2017
author=ethbets
header="/* Copyright (C) ${year} ${author}\n * All rights reserved.\n * \n * This software may be modified and distributed under the terms\n * of the BSD license. See the LICENSE file for details.\n*/\n"

gsed -i "1i ${header}" $1
