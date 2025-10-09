import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const HeroSection = () => {
    const heroImage = PlaceHolderImages.find(img => img.id === 'hero-background');

    return (
        <section className="relative w-full h-[50vh] min-h-[300px] max-h-[450px] flex items-center justify-center text-center text-white overflow-hidden">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                    priority
                />
            )}
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-4">
                <h1  className="text-5xl md:text-7xl font-bold font-headline drop-shadow-lg ">
                    <span className='text-[#FFB347]'>K</span>IS-<span className='text-blue-500'>N</span>oma<span className='text-[#FFB347]'>d</span>
                </h1>
                <p className="text-lg md:text-xl mt-2 text-white/90 drop-shadow-md">
               KIS Intelligent weather companion for nomad.
                </p>
            </div>
        </section>
    );
};

export default HeroSection;
