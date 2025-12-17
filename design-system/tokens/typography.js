/**
 * Matcher Design System - Typography Tokens
 */

export const typography = {
	fontFamily: {
		primary: "'Inter', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
		fallback: "'Roboto', 'Helvetica Neue', 'Arial', sans-serif"
	},
	
	fontWeights: {
		regular: 400,
		medium: 500,
		semibold: 600,
		bold: 700
	},
	
	fontSizes: {
		xs: '12px',
		sm: '14px',
		base: '16px',
		lg: '18px',
		xl: '20px',
		'2xl': '24px',
		'3xl': '30px',
		'4xl': '36px'
	},
	
	lineHeights: {
		tight: 1.2,
		normal: 1.5,
		relaxed: 1.75
	},
	
	styles: {
		title: {
			fontWeight: 600,
			fontSize: '24px',
			lineHeight: 1.2
		},
		button: {
			fontWeight: 500,
			fontSize: '16px',
			lineHeight: 1.5
		},
		body: {
			fontWeight: 400,
			fontSize: '16px',
			lineHeight: 1.5
		},
		bio: {
			fontWeight: 400,
			fontSize: '16px',
			lineHeight: 1.5,
			maxWords: 20
		}
	}
};

export default typography;

