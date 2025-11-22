interface ImgProps {
	src: string
	alt: string
	title?: string
	className?: string
	button?: HTMLButtonElement
}

export function createImg(props: ImgProps): HTMLImageElement {
	const img: HTMLImageElement = document.createElement('img')
	img.src = props.src
	img.alt = props.alt
	img.title = props.title ?? ''
	img.className = props.className ?? ''
	if (props.button) {
		img.append(props.button)
	}
	return img
}
