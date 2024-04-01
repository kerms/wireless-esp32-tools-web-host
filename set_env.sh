#!/bin/bash
export VITE_APP_GIT_TAG=$(git describe --tags)
export VITE_APP_LAST_COMMIT=$(git log -1 --format=%cd)