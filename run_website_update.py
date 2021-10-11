import os
from bs4 import BeautifulSoup


def capture_new_image():
    return 3


def get_most_recent_image(index, img_dir):
    files_list = os.listdir(img_dir)
    files_list.sort(reverse=True)
    if index <= len(files_list):
        return_image = os.path.join(img_dir, files_list[index])
    else:
        dummy_image = 'https://dummyimage.com/600x400/ffffff/ffffff'
        return_image = dummy_image

    return return_image


def update_images_in_html(html_path, img_dir):
    base_path = os.path.dirname(os.path.abspath(__file__))
    html = open(os.path.join(base_path, html_path))
    bs = BeautifulSoup(html, 'html.parser')

    # Find all carousel-items in the HTML file
    images = bs.find_all("div", {"class": 'carousel-item'})
    for i, img in enumerate(images):
        past_image = img.contents[1].attrs['src']
        image_text = img.contents[3].text
        most_recent_image = get_most_recent_image(index=i, img_dir=img_dir)
        img.attrs['src'] = most_recent_image
        print(img.attrs['src'])
        print('Image {} changed from {} to {}'.format(i + 1, past_image, most_recent_image))

    # Save updated html
    with open(html_path, "wb") as f_output:
        f_output.write(bs.prettify("utf-8"))


if __name__ == '__main__':
    img_dir = 'assets/img/via_direta'

    update_images_in_html(html_path='via_direta_vacina_fila.html', img_dir='assets/img/via_direta')
