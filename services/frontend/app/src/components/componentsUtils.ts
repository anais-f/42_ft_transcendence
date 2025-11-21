interface interfaceLink {
	href: string
	title: string
	className?: string //style ie : bg-white, text-black
	imgSrc?: string
	imgAlt?: string
	imgClass?: string
	onClick?: (ev: MouseEvent) => void
}

interface interfaceButton {
	label?: string
	className?: string
	name?: string
	type?: string
	disabled?: boolean
	formAction?: string
	formEnctype?: string
	formMethod?: string
	formNoValidate?: boolean
	formTarget?: string
	onClick?: (ev: MouseEvent) => void
}

export class Button implements interfaceButton {
	label?: string
	className?: string
	name?: string
	type?: string
	disabled?: boolean
	formAction?: string
	formEnctype?: string
	formMethod?: string
	formNoValidate?: boolean
	formTarget?: string
	onClick?: (ev: MouseEvent) => void

	constructor(
		label?: string,
		className?: string,
		name?: string,
		type?: string,
		onClick?: (ev: MouseEvent) => void
	) {
		this.label = label
		this.className = className
		this.name = name
		this.type = type
		this.onClick = onClick
	}

	setClassName(className: string): void {
		this.className = className
	}

	addStyle(style: string): void {
		if (this.className) this.className += ' ' + style
		else this.className = style
	}

	addPositioning(positioning: string): void {
		this.addStyle(positioning)
	}
}

interface interfaceImage {
	src: string
	alt: string
	title?: string
	className?: string
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
	const newAnchor: HTMLAnchorElement = document.createElement('a')

	newAnchor.href = linkDef.href
	if (linkDef.className) newAnchor.className = linkDef.className
	if (linkDef.onClick) newAnchor.addEventListener('click', linkDef.onClick)
	if (linkDef.imgSrc) {
		const img: HTMLImageElement = document.createElement('img')
		img.src = linkDef.imgSrc
		img.alt = linkDef.imgAlt ?? ''
		if (linkDef.imgClass) img.className = linkDef.imgClass
		newAnchor.append(img) // append or prepend ?
	}
	const title = document.createElement('span')
	title.textContent = linkDef.title
	newAnchor.appendChild(title)
	return newAnchor
}

export function createButton(bProp: interfaceButton): HTMLButtonElement {
	const newButton: HTMLButtonElement = document.createElement('button')

	newButton.name = bProp.name ?? ''
	newButton.className = bProp.className ?? ''
	if (
		bProp.type === 'submit' ||
		bProp.type === 'reset' ||
		bProp.type === 'button'
	)
		newButton.type = bProp.type
	else newButton.type = 'button'
	newButton.textContent = bProp.label ?? bProp.name ?? ''
	if (bProp.onClick) newButton.addEventListener('click', bProp.onClick)
	return newButton
}
