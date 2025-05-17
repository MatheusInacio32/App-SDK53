import React from 'react';
import { View, Text, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Shadow } from 'react-native-shadow-2';           
type Prestador = {
  id: number;
  name: string;
  area: string;
  image: any;       
  rating?: number;  
};

type RankingPrestadorProps = {
  data: Prestador[];
  fontRegular?: string;
  fontBold?: string;
};

const podiumMeta = [
  { icon: 'trophy', border: '#FCD34D' }, 
  { icon: 'medal',  border: '#E5E7EB' }, 
  { icon: 'medal',  border: '#D97706' }, 
];

export function RankingPrestador({
  data,
  fontRegular = 'System',
  fontBold = 'System',
}: RankingPrestadorProps) {
  const order = [1, 0, 2];
  const display = order
    .map(i => data[i])
    .filter(Boolean)          
    .map((p, idx) => ({ ...p, rank: order[idx] }));

  const renderStars = (score: number = 5) =>
    Array.from({ length: 5 }).map((_, i) =>
      score >= i + 1
        ? <FontAwesome key={i} name="star"      size={12} color="#FBBF24" />
        : score >= i + 0.5
        ? <FontAwesome key={i} name="star-half" size={12} color="#FBBF24" />
        : <FontAwesome key={i} name="star-o"    size={12} color="#FBBF24" />
    );

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={700}
      className="mx-4 mt-4 bg-white rounded-2xl p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      <View className="flex-row items-center mb-4">
        <FontAwesome5 name="trophy" size={22} color="#FBBF24" className="mr-2" />
        <Text className="text-lg text-black" style={{ fontFamily: fontBold }}>
          Melhores Prestadores do Mês
        </Text>
      </View>
      <View className="flex-row justify-around items-end">
        {display.map(({ id, name, area, image, rating, rank }) => {
          const { icon, border } = podiumMeta[rank] ?? {
            icon: 'medal',
            border: '#000',
          };

          const isFirst = rank === 0;
          const cardHeight = isFirst ? 160 : 140;

          return (
                <Shadow
                  key={id}
                  distance={7}
                  offset={[0, 0]}
                  startColor="rgba(0,0,0,0.13)"
                  style={{ borderRadius: 12 }}
                  containerStyle={{ marginHorizontal: 3 }} 
                >
                  <View
                    className="w-28 items-center rounded-xl py-2"
                    style={{
                      height: cardHeight,
                      backgroundColor: '#FAFAF4',
                    }}
                  >
                <View
                  className="rounded-full p-0.5 mb-1"
                  style={{ borderWidth: 2, borderColor: border }}
                >
                  <Image
                    source={image}
                    className="w-14 h-14 rounded-full"
                    resizeMode="cover"
                  />
                </View>
                <Text
                  className="text-sm text-center text-black"
                  numberOfLines={1}
                  style={{ fontFamily: fontBold }}
                >
                  {name}
                </Text>
                <Text
                  className="text-xs text-center text-gray-500 mb-1"
                  numberOfLines={1}
                  style={{ fontFamily: fontRegular }}
                >
                  {area}
                </Text>
                <View className="flex-row">{renderStars(rating)}</View>
                <View className="flex-row items-center mt-1">
                  <FontAwesome5 name={icon as any} size={14} color={border} />
                  <Text
                    className="ml-1 text-xs text-black"
                    style={{ fontFamily: fontBold }}
                  >
                    {`${rank + 1}º`}
                  </Text>
                </View>
              </View>
            </Shadow>
          );
        })}
      </View>
    </Animatable.View>
  );
}
