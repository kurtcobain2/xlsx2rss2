from dotenv import load_dotenv
import os
import json
import pandas as pd
from datetime import datetime
from dicttoxml2 import dicttoxml
from xml.dom.minidom import parseString

import utils

load_dotenv()


FNAME = os.environ['FILE_NAME']
PASS_KEY = os.environ['PASS_KEY']
TEMP_FOLDER_DATA = os.environ['TEMP_FOLDER_DATA']

NOW = datetime.now()
NOW_FORMAT_DATE = NOW.replace(tzinfo=NOW.astimezone().tzinfo).strftime('%a, %d %b %Y %H:%M:%S %z')

fname = f'files/{FNAME}.xlsx'

# naver rss.xml
df_data = utils.read_protected_excel(fname, PASS_KEY)
rss_items, rss_failed = utils.make_rss_items_naver(df_data, NOW_FORMAT_DATE)

RSS_JSON = {
    "rss": {
        "channel": {
            "title": "타이틀",
            "link": "링크",
            "image": {
                "url": "",
                "title": "",
                "link": ""
            },
            "description": "",
            "item": rss_items
        }
    }
}

xml_data = dicttoxml(RSS_JSON, custom_root='root', attr_type=False)
xml_str = parseString(xml_data).toprettyxml()

with open(os.path.join(TEMP_FOLDER_DATA, f'{FNAME}_naver_rss.xml'), 'w', encoding='utf-8') as f:
    f.write(xml_str)


with open(os.path.join(TEMP_FOLDER_DATA, f'{FNAME}_naver_rss_successed.json'), 'w', encoding='utf-8') as f:
    json.dump(rss_items, f, ensure_ascii=False)

with open(os.path.join(TEMP_FOLDER_DATA, f'{FNAME}_naver_rss_failed.json'), 'w', encoding='utf-8') as f:
    fail_json = { 
        "cnt": len(rss_failed),
        "detail": []
    }

    for idx in rss_failed:
        fail_detail = {
            "row_idx": idx
        }
        if len(df_data.iloc[idx][df_data.iloc[idx].isna()]) > 0:
            fail_detail["cause"] = "데이터가 없습니다"

        fail_json['detail'].append(fail_detail)

    json.dump(fail_json, f, ensure_ascii=False)