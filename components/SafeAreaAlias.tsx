import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function SafeAreaAlias({ children }: { children: React.ReactNode }) {
    const insets = useSafeAreaInsets();
    
    return (
        <View
        style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }}
        >
        {children}
        </View>
    );
}