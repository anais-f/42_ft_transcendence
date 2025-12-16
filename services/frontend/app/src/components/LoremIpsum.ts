interface LoremIpsumProps {
	title?: string
	variant?: 'short' | 'medium' | 'long'
	additionalClasses?: string
}

const LOREM_TEXT = `
Lorem ipsum dolor sit amet consectetur adipiscing elit. Semper vel class aptent taciti sociosqu ad litora. Blandit quis suspendisse aliquet nisi sodales consequat magna. Cras eleifend turpis fames primis vulputate ornare sagittis.
Sem placerat in id cursus mi pretium tellus. Orci varius natoque penatibus et magnis dis parturient. Finibus facilisis dapibus etiam interdum tortor ligula congue. Proin libero feugiat tristique accumsan maecenas potenti ultricies.
Sed diam urna tempor pulvinar vivamus fringilla lacus. Eros lobortis nulla molestie mattis scelerisque maximus eget. Porta elementum a enim euismod quam justo lectus. Curabitur facilisi cubilia curae hac habitasse platea dictumst.
Nisl malesuada lacinia integer nunc posuere ut hendrerit. Efficitur laoreet mauris pharetra vestibulum fusce dictum risus. Imperdiet mollis nullam volutpat porttitor ullamcorper rutrum gravida.
Adipiscing elit quisque faucibus ex sapien vitae pellentesque. Ad litora torquent per conubia nostra inceptos himenaeos. Consequat magna ante condimentum neque at luctus nibh.
Ornare sagittis vehicula praesent dui felis venenatis ultrices. Pretium tellus duis convallis tempus leo eu aenean. Dis parturient montes nascetur ridiculus mus donec rhoncus. Ligula congue sollicitudin erat viverra ac tincidunt nam.
Potenti ultricies habitant morbi senectus netus suscipit auctor. Fringilla lacus nec metus bibendum egestas iaculis massa. Maximus eget fermentum odio phasellus non purus est. Justo lectus commodo augue arcu dignissim velit aliquam.
Platea dictumst lorem ipsum dolor sit amet consectetur. Ut hendrerit semper vel class aptent taciti sociosqu. Dictum risus blandit quis suspendisse aliquet nisi sodales. Rutrum gravida cras eleifend turpis fames primis vulputate.
Vitae pellentesque sem placerat in id cursus mi. Inceptos himenaeos orci varius natoque penatibus et magnis. Luctus nibh finibus facilisis dapibus etiam interdum tortor. Venenatis ultrices proin libero feugiat tristique accumsan maecenas.
`

export const LoremSection = ({
	title,
	variant = 'medium',
	additionalClasses = ''
}: LoremIpsumProps): string => {
	const variantConfig = {
		short: 'line-clamp-3',
		medium: 'line-clamp-8',
		long: 'line-clamp-15'
	}

	const clampClass = variantConfig[variant]
	const paragraphClasses =
		`text-sm h-full overflow-hidden ${clampClass} ${additionalClasses}`.trim()

	const titleHtml = title ? `<h2 class="text-lg font-medium">${title}</h2>` : ''

	return /*html*/ `
    <div class="news_paragraph">
      ${titleHtml}
      <p class="${paragraphClasses}">
        ${LOREM_TEXT}
      </p>
    </div>
  `
}
