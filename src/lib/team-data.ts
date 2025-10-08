import { PlaceHolderImages } from './placeholder-images';

export type TeamMember = {
  name: string;
  role: string;
  imageUrl: string;
  imageHint: string;
};

const getImageData = (id: string) => {
    const image = PlaceHolderImages.find(img => img.id === id);
    if (!image) {
        return { imageUrl: '', imageHint: 'placeholder' };
    }
    return { imageUrl: image.imageUrl, imageHint: image.imageHint };
}

export const teamMembers: TeamMember[] = [
  {
    name: 'Alex Johnson',
    role: 'Lead Developer',
    ...getImageData('student-1'),
  },
  {
    name: 'Maria Garcia',
    role: 'UI/UX Designer',
    ...getImageData('student-2'),
  },
  {
    name: 'Sam Lee',
    role: 'AI Specialist',
    ...getImageData('student-3'),
  },
];
