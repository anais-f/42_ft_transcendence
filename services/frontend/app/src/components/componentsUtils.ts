interface interfaceLink {
    href: string,
    title: string,
    className?: string, //style ie : bg-white, text-black
    imgSrc?: string,
    imgAlt?: string,
    imgClass?: string,
    onClick?: (ev: MouseEvent) => void
}

interface interfaceButton {
    label?: string,
    className?: string,
    name?: string,
    type?: string,
    disabled?: boolean,
    formAction?: string,
    formEnctype?: string,
    formMethod?: string,
    formNoValidate?: boolean,
    formTarget?: string,
    onClick?: (ev: MouseEvent) => void
}

interface interfaceImage {
    src: string,
    alt: string,
    title?: string,
    className?: string,
}

export function createImage(imgDef: interfaceImage): HTMLImageElement {
    const newImg: HTMLImageElement = document.createElement('img')
    newImg.src = imgDef.src
    newImg.alt = imgDef.alt
    newImg.title = imgDef.title ?? ''
    newImg.className = imgDef.className ?? ''
    return newImg
}

export function createLink(linkDef: interfaceLink): HTMLAnchorElement {

    const newAnchor: HTMLAnchorElement = document.createElement('a');

    newAnchor.href = linkDef.href;
    if (linkDef.className)
        newAnchor.className = linkDef.className;
    if (linkDef.onClick)
        newAnchor.addEventListener('click', linkDef.onClick)
    if (linkDef.imgSrc)
    {
        const img: HTMLImageElement = document.createElement('img');
        img.src = linkDef.imgSrc;
        img.alt = linkDef.imgAlt ?? ''
        if (linkDef.imgClass)
            img.className = linkDef.imgClass;
        newAnchor.append(img); // append or prepend ?
    }
    const title = document.createElement('span')
    title.textContent = linkDef.title
    newAnchor.appendChild(title)
    return newAnchor;
}

export function createButton(buttonDef: interfaceButton): HTMLButtonElement {
    const newButton: HTMLButtonElement = document.createElement('button');

    newButton.name = buttonDef.name ?? ''
    newButton.className = buttonDef.className ?? ''
    if (buttonDef.type === 'submit' || buttonDef.type === 'reset' || buttonDef.type === 'button')
        newButton.type = buttonDef.type;
    else
        newButton.type = 'button'
    newButton.textContent = buttonDef.label ?? buttonDef.name ?? ''
    if (buttonDef.onClick)
        newButton.addEventListener('click', buttonDef.onClick)
    return newButton;
}