import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, RouteProp, useTheme} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as Keychain from 'react-native-keychain';

import {CustomIcon, ScreenSafeArea, TextByScale} from '_atoms';
import {Button} from '_molecules';
import {PostPreview} from '_componentsForThisApp';

import {AppStackParamList} from '_navigations';
import {
  getPercentageInHex,
  MyThemeInterfaceColors,
  themedStyleSheet,
} from '_utils';
import {
  getBalance,
  getUserAddress,
  loadLocalData,
  PostInterface,
  saveLocalData,
  useGetPosts,
} from '_db';

import {CUSTOM_FONT, PAGINATION_SIZE} from 'src/config/constants';
import AnimatedLottieView from 'lottie-react-native';
import {animation_loading} from 'src/assets/animations';

export type Screen_Home__Params = {
  updateTime?: number;
  redirectTo?: keyof AppStackParamList;
  createLocalPost?: PostInterface;
};

type Screen_Home__Prop = NativeStackNavigationProp<
  AppStackParamList,
  'Screen_Home'
>;

export const Screen_Home: React.FC<{
  route: RouteProp<{
    params: Screen_Home__Params;
  }>;
}> = ({route}) => {
  const styles = useStyles();
  const colors = useTheme().colors as unknown as MyThemeInterfaceColors;

  const navigation = useNavigation<Screen_Home__Prop>();
  const {params} = route;

  const {getPosts, posts, loading, getMore, limitReached, editLocalPosts} =
    useGetPosts({paginationSize: PAGINATION_SIZE});

  const [voteInProgress, setVoteInProgress] = useState(false);
  const [userLogged, setUserLogged] = useState(false);
  const [userLoggedLoading, setUserLoggedLoading] = useState(true);
  const [myAddress, setMyAddress] = useState('');
  const [oldUpdateTime, setOldUpdateTime] = useState(0);
  const [loadingUserAddress, setLoadingUserAddress] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showTrendingPosts, setShowTrendingPosts] = useState(false);

  React.useEffect(() => {
    console.log('on mount home screen');

    // delete all this console.log - is for not showing error of unused vars
    if (!colors) console.log();
    if (!navigation) console.log();
    if (!params) console.log();

    checkUserLogged();
    getPosts();
    getLocalData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // do refresh when go back to this screen and updateTime is changed
  useEffect(() => {
    if (params?.updateTime && params.updateTime !== oldUpdateTime) {
      setOldUpdateTime(params?.updateTime);

      getUserBalance(myAddress);

      if (params?.createLocalPost) {
        // if redirect to this screen with new local post to create, then create it
        editLocalPosts.createLocalPost(params.createLocalPost);
      } else {
        // only refetch posts
        getPosts();
      }
    }
  }, [
    params?.updateTime,
    params?.createLocalPost,
    getPosts,
    oldUpdateTime,
    editLocalPosts,
    myAddress,
  ]);

  useEffect(() => {
    if (params?.redirectTo) {
      navigation.navigate(params.redirectTo);
    }
  }, [params?.redirectTo, navigation]);

  useEffect(() => {
    if (!loading && limitReached) {
      Alert.alert('No new results');
    }
  }, [loading, limitReached]);

  useEffect(() => {
    if (refreshing && !loading) setRefreshing(false);
  }, [loading, refreshing]);

  useEffect(() => {
    if (userLogged) getAndSetUserAddress();
  }, [userLogged]);

  const getAndSetUserAddress = async () => {
    const {userAddress, error} = await getUserAddress();
    if (!error) await setMyAddress(userAddress);

    setLoadingUserAddress(false);
  };

  const getUserBalance = async (userAddress: string) => {
    if (userAddress) {
      const {error} = await getBalance(userAddress);

      if (error) Alert.alert('Error getting user balance', error);
    }
  };

  const getLocalData = async () => {
    const _showTrendingPosts = await loadLocalData('showTrendingPosts');
    setShowTrendingPosts(!!_showTrendingPosts);
  };

  const checkUserLogged = async () => {
    const _userLogged = !!(await Keychain.getGenericPassword());
    setUserLogged(_userLogged);
    setUserLoggedLoading(false);

    if (!_userLogged) setLoadingUserAddress(false);
  };

  useEffect(() => {
    if (myAddress) getUserBalance(myAddress);
  }, [myAddress]);

  const onRefresh = React.useCallback(async () => {
    await setRefreshing(true);
    await getPosts();
  }, [getPosts]);

  const goToProfileIsLoading = userLoggedLoading
    ? true
    : !userLogged || myAddress
    ? false
    : true;

  return (
    <ScreenSafeArea colorStatusBar={colors.background}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{...styles.header, flex: 1}}>
            <TouchableOpacity
              style={{padding: 10}}
              onPress={async () => {
                await saveLocalData('slidesAlreadySeen', '');
                await saveLocalData(
                  'devMode',
                  (await loadLocalData('devMode')) ? '' : 'true',
                );
              }}>
              <TextByScale
                scale="h1"
                style={styles.appName}
                color={colors.primary}>
                Ekiras
              </TextByScale>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const alreadyShowingTrendingPosts = !!(await loadLocalData(
                  'showTrendingPosts',
                ));

                setShowTrendingPosts(!alreadyShowingTrendingPosts);
                await saveLocalData(
                  'showTrendingPosts',
                  alreadyShowingTrendingPosts ? '' : 'true',
                );
                await getPosts();
              }}
              style={{
                ...styles.trendingPostIcon,
                ...(showTrendingPosts ? styles.showTrendingPostSelected : {}),
              }}>
              <TextByScale>🔥</TextByScale>
            </TouchableOpacity>
          </View>
          {!goToProfileIsLoading ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Screen_CreatePost')}
              style={{padding: 10}}>
              <CustomIcon name="add" type="material" />
            </TouchableOpacity>
          ) : null}
          {!goToProfileIsLoading ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('Screen_Profile')}
              activeOpacity={goToProfileIsLoading ? 1 : 0.8}
              style={{padding: 10}}>
              <CustomIcon name="ios-person-sharp" type="ionicon" />
            </TouchableOpacity>
          ) : null}
        </View>
        {(!posts.length && loading) || loadingUserAddress ? (
          <View style={styles.loadingContainer}>
            <TextByScale scale="h2">Loading posts...</TextByScale>
            <AnimatedLottieView
              source={animation_loading}
              autoPlay
              loop
              style={{width: '90%', marginTop: -20}}
            />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={({item}) => (
              <PostPreview
                post={item}
                myAddress={myAddress}
                setVoteInProgress={setVoteInProgress}
                voteInProgress={voteInProgress}
                updateLocalPost={editLocalPosts.updateLocalPost}
                removeLocalPost={editLocalPosts.removeLocalPost}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingTop: 20, paddingBottom: 50}}
            ItemSeparatorComponent={() => <View style={{height: 20}} />}
            ListFooterComponent={
              <Button
                onPress={getMore}
                loading={loading}
                text="Get more posts"
                style={{
                  marginVertical: 30,
                  width: '80%',
                  alignSelf: 'center',
                }}
              />
            }
          />
        )}
      </View>
    </ScreenSafeArea>
  );
};

const useStyles = themedStyleSheet((colors: MyThemeInterfaceColors) => ({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontFamily: CUSTOM_FONT.SEMI_BOLD,
    letterSpacing: 5,
    // shadow style ──────────────
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
    // shadow style ──────────────
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingPostIcon: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    borderRadius: 10,
  },
  showTrendingPostSelected: {
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: colors.primary + getPercentageInHex(20),
  },
}));
