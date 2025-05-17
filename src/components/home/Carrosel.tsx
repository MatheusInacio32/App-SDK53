import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

import Carrosel1 from '../../assets/Carrosel1.png';
import Carrosel2 from '../../assets/Carrosel2.png';
import Carrosel3 from '../../assets/Carrosel3.png';
import Carrosel4 from '../../assets/Carrosel4.png';

export function Carrosel() {
  const images = [Carrosel4, Carrosel1, Carrosel3, Carrosel2];
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);


  const { width } = Dimensions.get('window');
  const horizontalMargin = 32;           
  const carouselWidth  = width - horizontalMargin;

  /** Proporção 1500×700  →  altura = largura × (700 / 1500) */
  const CAROUSEL_HEIGHT = carouselWidth * (700 / 1500);


  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollRef.current?.scrollTo({ x: nextIndex * carouselWidth, animated: true });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length, carouselWidth]);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / carouselWidth);
    setCurrentIndex(index);
  };

  return (
    <View className="items-center mt-4">
      <View
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{ width: carouselWidth, height: CAROUSEL_HEIGHT }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={onScrollEnd}
          showsHorizontalScrollIndicator={false}
          style={{ width: carouselWidth, height: CAROUSEL_HEIGHT }}
        >
          {images.map((img, index) => (
            <View
              key={index}
              style={{
                width: carouselWidth,
                height: CAROUSEL_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={img}
                resizeMode="cover"
                style={{ width: '100%', height: '100%' }}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      <View className="flex-row justify-center mt-2">
        {images.map((_, i) => (
          <View
            key={i}
            className={`
              ${i === currentIndex ? 'bg-yellow-400 w-[7px] h-[7px]' : 'bg-gray-500 w-[7px] h-[7px]'}
              mx-1 rounded-full
            `}
          />
        ))}
      </View>
    </View>
  );
}
