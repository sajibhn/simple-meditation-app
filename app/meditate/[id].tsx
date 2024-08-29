import { View, Text, ImageBackground, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import meditationImages from '@/constants/meditation-images'
import AppGradient from '@/components/AppGradient'
import { router, useLocalSearchParams } from 'expo-router'
import { AntDesign } from '@expo/vector-icons'
import CustomButton from '@/components/CustomButton'
import { Audio } from 'expo-av'
import { MEDITATION_DATA, AUDIO_FILES } from '@/constants/meditation-data'

const Meditate = () => {
	const {id} = useLocalSearchParams();

	const [secondsRemaining, setSecondsRemaining] = useState(10);
	const [isMeditating, setMeditating] = useState(false)
	const [audioSound, setSound] = useState<Audio.Sound>();
	const [isPlayingAudio, setPlayAudio] = useState<Boolean>(false)

	useEffect(()=>{
		let timerId: NodeJS.Timeout;

		if(secondsRemaining === 0) {
			setMeditating(false)
			return;
		}

		if (isMeditating){
			timerId = setTimeout(() => {
				setSecondsRemaining(secondsRemaining - 1);
			}, 1000)
		}

		return () => {
			clearTimeout(timerId)
		}

	}, [secondsRemaining, isMeditating])

	useEffect(()=> {
		return () => {
			audioSound?.unloadAsync();
		}
	}, [audioSound])

	const toggleMeditationSessionStatus = async () => {
		if(secondsRemaining === 0) setSecondsRemaining(10)

			setMeditating(!isMeditating);

			await toggleSound();
	}

	const toggleSound = async () => {
		const sound = audioSound ? audioSound : await initializeSound();

		const status = await sound?.getStatusAsync()

		if (status?.isLoaded && !isPlayingAudio) {
			await sound.playAsync();
			setPlayAudio(true)
		} else {
			await sound.pauseAsync()
			setPlayAudio(true)
		}
	}

	const initializeSound = async () => {
		const audioFileName = MEDITATION_DATA[Number(id) -1].audio

		const  {sound} = await Audio.Sound.createAsync(
			AUDIO_FILES[audioFileName]
		)

		setSound(sound);
		return sound;
	}

	const formattedTimeMinutes = String(Math.floor(secondsRemaining / 60)).padStart(2, "0")
	const formattedTimeSeconds = String(Math.floor(secondsRemaining % 60)).padStart(2, "0")

	return (
		<View className='flex-1'>
			<ImageBackground source={meditationImages[Number(id)] - 1}
				resizeMode='cover'
				className='flex-1'
			>
				<AppGradient
					colors={["transparent", "rgba(0,0,0,0.8)"]}
				>
					<Pressable
						onPress={() => router.back()}
						className='absolute top-16 left-6 z-10'
					>
						<AntDesign name='leftcircleo' size={50} color="white" />
					</Pressable>

					<View className='flex-1 justify-center'>
						<View className='mx-auto bg-neutral-200 rounded-full w-44 h-44 justify-center items-center'>
							<Text className='text-4xl text-blue-400 font-rmono'>{formattedTimeMinutes}:{formattedTimeSeconds}</Text>
						</View>
					</View>

					<View className='mb-5'>
						<CustomButton title='Start Meditate' onPress={toggleMeditationSessionStatus}  />
					</View>
				</AppGradient>
			</ImageBackground>
		</View>
	)
}

export default Meditate