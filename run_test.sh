#!/bin/sh

list_icon_old=$(find . -name favicon.ico)
ulr_icon_new='./images_ript/favicon.ico'
# echo "$list_icon_old"
for icon_old in $list_icon_old
do
    if [ $icon_old = "./images_ript/favicon.ico" ]; then
        continue
    fi
    echo "icon_old: $icon_old"
    # echo "ulr_icon_new: $ulr_icon_new"
    cp -f $ulr_icon_new $icon_old
done


url_icon_old='./packages/bp/dist/data/assets/studio/ui/public/img/logo-icon.svg'
url_icon_new='./images_ript/logo-icon.svg'
cp -f $url_icon_new $url_icon_old

logo_icon_white_old='./packages/bp/dist/data/assets/studio/ui/public/img/logo_white.png'
logo_icon_white_new='./images_ript/logo_white.png'

cp -f $logo_icon_white_new $logo_icon_white_old

logo_icon_grey_old='./packages/bp/dist/data/assets/studio/ui/public/img/logo_grey.png'
logo_icon_grey_new='./images_ript/logo_grey.png'
cp -f $logo_icon_grey_new $logo_icon_grey_old

icon32='./packages/bp/dist/data/assets/studio/ui/public/img/favicon-32x32.png'
icon32_new='./images_ript/favicon-32x32.png'
cp -f $icon32_new $icon32

icon_png='./packages/bp/dist/data/assets/studio/ui/public/img/favicon.png' 
icon_png_new='./images_ript/favicon.png'

cp -f $icon_png_new $icon_png