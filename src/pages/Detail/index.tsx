import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import api from '../../services/api';
import MailComposer from 'expo-mail-composer';
import { Linking } from 'expo';
interface Point {
    id: number;
    name: string;
    image: string;
    imageUrl: string;
    whatsapp: string;
    email: string;
    city: string;
    state: string;
    items: {
        title: string;
    }[]
}
interface Item {
    title: string;
}
interface Data {
    point: Point;
    items: Item[]
}
interface Params {
    id: number;
}
const Detail = () => {
    const route = useRoute();
    const routeParams = route.params as Params;
    const navigation = useNavigation();
    const [data, setData] = useState<Data>({} as Data);
    function handleNavigateBack() {
        navigation.navigate('Points');
    }
    useEffect(() => {
        api.get(`points/${routeParams.id}`).then(response => {
            setData(response.data);
        })
    });

    function handleComposeEmail() {
        MailComposer.composeAsync({
            subject: 'Interesse na coleta de residuos',
            recipients: [data.point.email]
        });
    }

    function handleWhatsapp() {
        Linking.canOpenURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Tenho interesse sobre coleta de residuos`)
    }

    if (!data.point) {
        return null;
    }


    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79"></Icon>
                </TouchableOpacity>
                <Image style={styles.pointImage} source={{ uri: data.point.imageUrl }}></Image>
                <Text style={styles.pointName}>{data.point.name}</Text>
                <Text style={styles.pointItems}>{data.items.map(x => x.title).join(', ')}</Text>
                <View style={styles.address}>
                    <Text style={styles.addressTitle}>
                        Endereço
                </Text>
                    <Text style={styles.addressContent}>
                        {data.point.city}, {data.point.state}
                    </Text>
                </View>

            </View>
            <View style={styles.footer}>
                <RectButton style={styles.button} onPress={handleWhatsapp} >
                    <FontAwesome name="whatsapp" size={20} color="#FFF" ></FontAwesome>
                    <Text style={styles.buttonText}> Whatsapp</Text>
                </RectButton>
                <RectButton style={styles.button} onPress={handleComposeEmail}>
                    <Icon name="mail" size={20} color="#FFF" ></Icon>
                    <Text style={styles.buttonText}> E-mail</Text>
                </RectButton>
            </View>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    pointImage: {
        width: '100%',
        height: 120,
        resizeMode: 'cover',
        borderRadius: 10,
        marginTop: 32,
    },

    pointName: {
        color: '#322153',
        fontSize: 28,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    pointItems: {
        fontFamily: 'Roboto_400Regular',
        fontSize: 16,
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    address: {
        marginTop: 32,
    },

    addressTitle: {
        color: '#322153',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    },

    addressContent: {
        fontFamily: 'Roboto_400Regular',
        lineHeight: 24,
        marginTop: 8,
        color: '#6C6C80'
    },

    footer: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#999',
        paddingVertical: 20,
        paddingHorizontal: 32,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    button: {
        width: '48%',
        backgroundColor: '#34CB79',
        borderRadius: 10,
        height: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        marginLeft: 8,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Roboto_500Medium',
    },
});
export default Detail;