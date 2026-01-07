/**
 * Generates a section of lorem ipsum text with optional title and varying lengths.
 * @param title - Optional title for the section.
 * @param variant - Length variant of the lorem ipsum text. Options are 'xs', 'short', 'medium', 'long', 'xl', and 'fill'.
 * @param additionalClasses - Additional CSS classes to apply to the paragraph.
 */
interface LoremIpsumProps {
	title?: string
	variant?: 'xs' | 'short' | 'medium' | 'long' | 'xl' | 'fill'
	additionalClasses?: string
}

export const LoremSection = ({
	title,
	variant = 'medium',
	additionalClasses = ''
}: LoremIpsumProps): string => {
	const variantConfig = {
		xs: 'line-clamp-2',
		short: 'line-clamp-4',
		medium: 'line-clamp-8',
		long: 'line-clamp-12',
		xl: 'line-clamp-20',
		fill: ''
	} as const

	const isFillMode = variant === 'fill'

	const paragraphClasses = isFillMode
		? `text-sm leading-relaxed overflow-hidden flex-1 min-h-0 ${additionalClasses}`.trim()
		: `text-sm leading-relaxed overflow-hidden ${variantConfig[variant]} ${additionalClasses}`.trim()

	const containerClasses = isFillMode
		? 'news_paragraph flex-1 min-h-0 flex flex-col'
		: 'news_paragraph overflow-hidden'

	const titleHtml = title
		? `<h2 class="text-lg font-medium overflow-hidden">${title}</h2>`
		: ''

	return /*html*/ `
    <div class="${containerClasses}">
      ${titleHtml}
      <p class="${paragraphClasses}">
        ${LOREM_TEXT}
      </p>
    </div>
  `
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
Suspendisse mollis erat et risus. Vestibulum et odio eu nisl malesuada dapibus. Morbi ac tortor et magna tincidunt ullamcorper. Ut pellentesque fermentum mi. Etiam sed neque sit amet leo consectetuer sagittis. Nulla facilisi. 
Sed lobortis erat vitae nulla. Duis bibendum ipsum et mi scelerisque dapibus. Fusce nonummy vestibulum orci. Donec a nisl. Integer ac nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. 
Aenean nec nunc sed dui lobortis vestibulum. Praesent metus ligula, auctor vitae, lacinia sed, hendrerit a, felis. Etiam sapien. Proin et sem vitae dolor sodales venenatis. Integer luctus aliquam risus.
Suspendisse mollis erat et risus. Vestibulum et odio eu nisl malesuada dapibus. Morbi ac tortor et magna tincidunt ullamcorper. Ut pellentesque fermentum mi. Etiam sed neque sit amet leo consectetuer sagittis.
Nulla facilisi. Sed lobortis erat vitae nulla. Duis bibendum ipsum et mi scelerisque dapibus. Fusce nonummy vestibulum orci. Donec a nisl. Integer ac nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Aenean nec nunc sed dui lobortis vestibulum. Praesent metus ligula, auctor vitae, lacinia sed, hendrerit a, felis. Etiam sapien. Proin et sem vitae dolor sodales venenatis. Integer luctus aliquam risus. Proin non sem. Donec nec erat. 
Proin libero. Aliquam viverra arcu. Donec vitae purus. Donec felis mi, semper id, scelerisque porta, sollicitudin sed, turpis. Nulla in urna. Integer varius wisi non elit. Etiam nec sem. 
Mauris consequat, risus nec congue condimentum, ligula ligula suscipit urna, vitae porta odio erat quis sapien. Proin luctus leo id erat. Etiam massa metus, accumsan pellentesque, sagittis sit amet, venenatis nec, mauris.
Praesent urna eros, ornare nec, vulputate eget, cursus sed, justo. Phasellus nec lorem. Nullam ligula ligula, mollis sit amet, faucibus vel, eleifend ac, dui. Aliquam erat volutpat.
Lorem ipsum dolor sit amet consectetur adipiscing elit. Semper vel class aptent taciti sociosqu ad litora. Blandit quis suspendisse aliquet nisi sodales consequat magna. Cras eleifend turpis fames primis vulputate ornare sagittis.
Sem placerat in id cursus mi pretium tellus. Orci varius natoque penatibus et magnis dis parturient. Finibus facilisis dapibus etiam interdum tortor ligula congue. Proin libero feugiat tristique accumsan maecenas potenti ultricies.
Sed diam urna tempor pulvinar vivamus fringilla lacus. Eros lobortis nulla molestie mattis scelerisque maximus eget. Porta elementum a enim euismod quam justo lectus. Curabitur facilisi cubilia curae hac habitasse platea dictumst.
Nisl malesuada lacinia integer nunc posuere ut hendrerit. Efficitur laoreet mauris pharetra vestibulum fusce dictum risus. Imperdiet mollis nullam volutpat porttitor ullamcorper rutrum gravida.
Adipiscing elit quisque faucibus ex sapien vitae pellentesque. Ad litora torquent per conubia nostra inceptos himenaeos. Consequat magna ante condimentum neque at luctus nibh.
Ornare sagittis vehicula praesent dui felis venenatis ultrices. Pretium tellus duis convallis tempus leo eu aenean. Dis parturient montes nascetur ridiculus mus donec rhoncus. Ligula congue sollicitudin erat viverra ac tincidunt nam.
Potenti ultricies habitant morbi senectus netus suscipit auctor. Fringilla lacus nec metus bibendum egestas iaculis massa. Maximus eget fermentum odio phasellus non purus est. Justo lectus commodo augue arcu dignissim velit aliquam.
Platea dictumst lorem ipsum dolor sit amet consectetur. Ut hendrerit semper vel class aptent taciti sociosqu. Dictum risus blandit quis suspendisse aliquet nisi sodales. Rutrum gravida cras eleifend turpis fames primis vulputate.
Vitae pellentesque sem placerat in id cursus mi. Inceptos himenaeos orci varius natoque penatibus et magnis. Luctus nibh finibus facilisis dapibus etiam interdum tortor. Venenatis ultrices proin libero feugiat tristique accumsan maecenas.
Suspendisse mollis erat et risus. Vestibulum et odio eu nisl malesuada dapibus. Morbi ac tortor et magna tincidunt ullamcorper. Ut pellentesque fermentum mi. Etiam sed neque sit amet leo consectetuer sagittis. Nulla facilisi. 
Sed lobortis erat vitae nulla. Duis bibendum ipsum et mi scelerisque dapibus. Fusce nonummy vestibulum orci. Donec a nisl. Integer ac nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. 
Aenean nec nunc sed dui lobortis vestibulum. Praesent metus ligula, auctor vitae, lacinia sed, hendrerit a, felis. Etiam sapien. Proin et sem vitae dolor sodales venenatis. Integer luctus aliquam risus.
Suspendisse mollis erat et risus. Vestibulum et odio eu nisl malesuada dapibus. Morbi ac tortor et magna tincidunt ullamcorper. Ut pellentesque fermentum mi. Etiam sed neque sit amet leo consectetuer sagittis.
Nulla facilisi. Sed lobortis erat vitae nulla. Duis bibendum ipsum et mi scelerisque dapibus. Fusce nonummy vestibulum orci. Donec a nisl. Integer ac nibh. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
Aenean nec nunc sed dui lobortis vestibulum. Praesent metus ligula, auctor vitae, lacinia sed, hendrerit a, felis. Etiam sapien. Proin et sem vitae dolor sodales venenatis. Integer luctus aliquam risus. Proin non sem. Donec nec erat. 
Proin libero. Aliquam viverra arcu. Donec vitae purus. Donec felis mi, semper id, scelerisque porta, sollicitudin sed, turpis. Nulla in urna. Integer varius wisi non elit. Etiam nec sem. 
Mauris consequat, risus nec congue condimentum, ligula ligula suscipit urna, vitae porta odio erat quis sapien. Proin luctus leo id erat. Etiam massa metus, accumsan pellentesque, sagittis sit amet, venenatis nec, mauris.
Praesent urna eros, ornare nec, vulputate eget, cursus sed, justo. Phasellus nec lorem. Nullam ligula ligula, mollis sit amet, faucibus vel, eleifend ac, dui. Aliquam erat volutpat.
`
