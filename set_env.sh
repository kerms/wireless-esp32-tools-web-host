#!/usr/bin/env bash

VITE_APP_GIT_TAG=$(git describe --tags | cut -d'-' -f1,2)
VITE_APP_LAST_COMMIT=$(git log -1 --format=%cd)

export VITE_APP_GIT_TAG
export VITE_APP_LAST_COMMIT