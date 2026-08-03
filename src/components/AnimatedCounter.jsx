import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

export function AnimatedCounter({ value, prefix = '', suffix = '' }) {
	const count = useMotionValue(0);
	const rounded = useTransform(count, (latest) => Math.round(latest));

	useEffect(() => {
		const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' });
		return controls.stop;
	}, [count, value]);

	return (
		<motion.span>
			{prefix}
			{rounded}
			{suffix}
		</motion.span>
	);
}
