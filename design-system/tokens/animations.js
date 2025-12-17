/**
 * Matcher Design System - Animation Tokens
 */

export const animations = {
	duration: {
		fast: '180ms',
		normal: '250ms',
		slow: '350ms'
	},
	
	easing: {
		easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
		easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
		easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
		elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
	},
	
	transitions: {
		short: {
			duration: '180ms',
			easing: 'cubic-bezier(0.0, 0, 0.2, 1)'
		},
		swipe: {
			duration: '300ms',
			easing: 'cubic-bezier(0.0, 0, 0.2, 1)'
		},
		modal: {
			duration: '250ms',
			easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
		}
	}
};

export default animations;

