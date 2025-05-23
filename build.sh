#!/bin/bash

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 UMM 앱 빌드 시작...${NC}\n"

# 이전 빌드 정리
echo -e "${BLUE}🧹 이전 빌드 파일 정리 중...${NC}"
rm -rf dist/
rm -rf .next/

# 임시 파일 정리
echo -e "${BLUE}🧹 임시 파일 정리 중...${NC}"
rm -rf /private/var/folders/*/T/t-*
rm -rf ~/Library/Caches/electron*
rm -rf ~/Library/Caches/electron-builder

# build 디렉토리 생성
echo -e "${BLUE}📁 build 디렉토리 생성 중...${NC}"
mkdir -p build

# 의존성 설치
echo -e "${BLUE}📦 의존성 설치 중...${NC}"
yarn install

# Next.js 빌드
echo -e "${BLUE}🛠 Next.js 빌드 중...${NC}"
yarn build

# macOS 빌드
echo -e "${BLUE}🍎 macOS 버전 빌드 중...${NC}"
yarn electron-builder --mac --arm64

# Windows 빌드
echo -e "${BLUE}🪟 Windows 버전 빌드 중...${NC}"
yarn electron-builder --win

echo -e "\n${GREEN}✨ 빌드 완료!${NC}"
echo -e "${GREEN}📁 빌드된 파일은 dist/ 디렉토리에 있습니다.${NC}" 