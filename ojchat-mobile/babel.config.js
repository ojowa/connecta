module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@store': './src/store',
            '@services': './src/services',
            '@utils': './src/utils',
            '@types': './src/types',
            '@constants': './src/constants',
            '@database': './src/database',
            '@navigation': './src/navigation',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
