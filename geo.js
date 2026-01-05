export function isCompatibleBloodType(donorType, recipientType) {
	const map = {
		'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
		'O+': ['O+', 'A+', 'B+', 'AB+'],
		'A-': ['A-', 'A+', 'AB-', 'AB+'],
		'A+': ['A+', 'AB+'],
		'B-': ['B-', 'B+', 'AB-', 'AB+'],
		'B+': ['B+', 'AB+'],
		'AB-': ['AB-', 'AB+'],
		'AB+': ['AB+'],
	};
	return map[donorType]?.includes(recipientType) || false;
}

export function buildGeoNearFilter(lng, lat, maxDistanceMeters = 20000) {
	return {
		location: {
			$near: {
				$geometry: { type: 'Point', coordinates: [lng, lat] },
				$maxDistance: maxDistanceMeters,
			},
		},
	};
}


