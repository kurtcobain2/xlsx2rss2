from io import BytesIO
import msoffcrypto
import pandas as pd

def read_protected_excel(file_path, password):
    decrypted = BytesIO()
    with open(file_path, 'rb') as f:
        file = msoffcrypto.OfficeFile(f)
        file.load_key(password=password)
        file.decrypt(decrypted)
        df = pd.read_excel(decrypted)
        del decrypted
    return df


def make_rss_items_naver(df, pubDate):
    rss_items = []
    rss_failed = []

    for idx,data in df.iterrows():
        try:
            # 0: keyword, 1: title, 2: link
            title = f'{data.iloc[1]} {data.iloc[0]}'.strip()
            link = data.iloc[2].strip()
            tag = data.iloc[0].strip()

            if (len(title) > 0 or len(link) > 0 or len(tag)):
                data_item = {
                    "title": title,
                    "link": link,
                    "description": title,
                    "pubDate": pubDate,
                    "guid": link,
                    "tag": tag
                }
            
                rss_items.append(data_item)
            else:
                rss_failed.append(idx)
        except:
            rss_failed.append(idx)

    return rss_items, rss_failed