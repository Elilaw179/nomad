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
    name: 'Engr.Law',
    role: 'Coding Teacher',
    ...getImageData('student-1'),
  },
  {
    name: 'Mr.Manny',
    role: 'Class Teacher',
    ...getImageData('student-2'),
  },
  {
    name: 'Engr.Monday',
    role: 'ICT Teacher',
    ...getImageData('student-3'),
  },
  {
    name: 'Engr.Solomon',
    role: 'ICT Supervisor',
    ...getImageData('student-4'),
  },
  {
    name: 'Champions',
    role: 'Year 9 Students',
    ...getImageData('student-5'),
  },
];
