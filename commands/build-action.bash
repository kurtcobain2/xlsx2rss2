#!/bin/bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 20


# 모든 하위 디렉토리를 순회
for dir in actions/*/; do
    # 디렉토리 이름에서 마지막 슬래시 제거
    dir=${dir%*/}

    # TypeScript 파일 찾기
    ts_file=$(find $dir -name "*.ts")

    if [ -n "$ts_file" ]; then
        echo "Building $dir..."
        
        # ncc 빌드 실행
        ncc build "$ts_file" -o "$dir/dist"
        
        if [ $? -eq 0 ]; then
            echo "Build successful for $dir"
        else
            echo "Build failed for $dir"
        fi
    else
        echo "No TypeScript file found in $dir"
    fi
done

echo "All builds completed."