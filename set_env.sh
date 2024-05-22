#!/bin/bash
export VITE_APP_GIT_TAG=$(git describe --tags | cut -d'-' -f1,2)
export VITE_APP_LAST_COMMIT=$(git log -1 --format=%cd)