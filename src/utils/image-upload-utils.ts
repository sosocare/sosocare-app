import * as ImagePicker from 'expo-image-picker'

export const pickImage = async (
  onPick?: (_: string | undefined) => any,
  onCancel?: () => any
) => {
  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    aspect: [4, 3],
    quality: 1,
    base64: true,
  })

  //console.log(result)

  if (!result.cancelled && result.uri && onPick) {
    onPick(result.uri)
  } else onCancel && onCancel()
}

export const openCamera = async (
  onSnap?: (_: string) => any,
  onCancel?: () => any
) => {
  // Ask the user for the permission to access the camera
  const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

  if (permissionResult.granted === false) {
    alert("You've refused to allow this appp to access your camera!")
    return
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    aspect: [4, 3],
    quality: 1,
    base64: true,
  })

  // Explore the result
  // console.log(result)

  if (!result.cancelled && result.uri && onSnap) {
    onSnap(result.uri)
  } else onCancel && onCancel()
}
