import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { SvgUri } from 'react-native-svg';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import api from '../../services/api';
import * as Location from 'expo-location';
interface Params {
    state?: string;
    city?: string;
}
interface Item {
    id: number;
    title: string;
    image: string;
    imageUrl: string;
}
interface Point {
    id: number;
    name: string;
    imageUrl: string;
    latitude: number;
    longitude: number;
}
const Points = () => {
    const route = useRoute();
    const params = route.params as Params;
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [points, setPoints] = useState<Point[]>([]);
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data)
        });
    }, []);

    useEffect(() => {
        api.get('points', {
            params: {
                city: params.city,
                state: params.state,
                items: [selectedItems]
            }
        }).then(response => {
            setPoints(response.data);
        });
    }, [selectedItems]);

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Ops!', 'Precisamos de sua permissão para obter a localização');
                return;
            }
            const location = await Location.getCurrentPositionAsync();
            const { latitude, longitude } = location.coords;
            setInitialPosition([latitude, longitude]);

        }
        loadPosition();
    }, []);

    const navigation = useNavigation();

    function handleSelectedItem(id: number) {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter(x => x != id));
            return;
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    function handleNavigateBack() {
        navigation.navigate('Home');
    }
    function handleNavigateToDetail(id: number) {
        navigation.navigate('Detail', { id: id });
    }
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
                </TouchableOpacity>
                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>
                <View style={styles.mapContainer}>
                    {
                        initialPosition[0] !== 0 && (
                            <MapView
                                style={styles.map}
                                initialRegion={{ latitude: initialPosition[0], longitude: initialPosition[1], latitudeDelta: 0.014, longitudeDelta: 0.014 }} loadingEnabled={initialPosition[0] == 0}>
                                {points.map(point => (
                                    <Marker key={String(point.id)} coordinate={{ latitude: Number(point.latitude), longitude: Number(point.longitude) }} style={styles.mapMarker} onPress={() => { handleNavigateToDetail(point.id) }}>
                                        <View style={styles.mapMarkerContainer}>
                                            <Image style={styles.mapMarkerImage} source={{ uri: point.imageUrl }}></Image>
                                            <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                        </View>
                                    </Marker>
                                ))}

                            </MapView>
                        )
                    }
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {items.map(item => (
                        <TouchableOpacity key={String(item.id)} style={[styles.item, selectedItems.includes(item.id) ? styles.selectedItem : {}]} onPress={() => {
                            handleSelectedItem(item.id)
                        }} activeOpacity={0.6}>
                            <SvgUri width={42} height={42} uri={item.imageUrl}></SvgUri>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}

                </ScrollView>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;