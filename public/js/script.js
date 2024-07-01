function resizeIframe(event) {
  const iframe = document.getElementById("my_iframe");
  const [key, val] = event.data.split("=");
  if (key == "height") {
    iframe.style.height = val;
    iframe.setAttribute("scrolling", "no");
    return;
  }
  if (key == "url") location.href = event.data.split("url=")[1];
}
window.addEventListener("message", resizeIframe, false);
function get_path(str) {
  if (!str) return null;
  str = str.split("?")[0];
  return str.split("https://www.cofcointernational.com")[1];
}

async function download_files() {
  const sources = document.querySelectorAll("picture source");
  const images = document.querySelectorAll("img");
  [...Array.from(sources), ...Array.from(images)].forEach((img) => {
    let src = img.getAttribute("src");
    let srcset = img.getAttribute("srcset");
    if (get_path(srcset)) img.setAttribute("srcset", get_path(srcset));
    else if (get_path(src)) img.setAttribute("src", get_path(src));
  });
  // const links = [];
  // images.forEach(async (img) => {
  //   const src = img.getAttribute("src") || img.getAttribute("srcset");
  //   if (!get_path(src)) return;
  //   links.push(src.trim());
  // });
  // uri = encodeURIComponent(JSON.stringify(links));
  // await fetch(`/download-file?uri=${uri}`);
}
document.addEventListener("DOMContentLoaded", download_files);
