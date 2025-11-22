interface LinkProps {
	href: string
	title?: string
	className?: string //style ie : bg-white, text-black
	img?: HTMLImageElement
	onClick?: (ev: MouseEvent) => void
}

export function createLink(props: LinkProps): HTMLAnchorElement{
    const link = document.createElement('a')
    link.href = props.href
    link.title = props.title ?? ''
    link.className = props.className ?? ''
    if (props.img) {
        link.append(props.img)
    }
    const title : HTMLElement = document.createElement('span')
    title.textContent = props.title ?? ''
    link.append(title)
    if (props.onClick) {
         link.addEventListener('click', props.onClick)
    }
    return link
}