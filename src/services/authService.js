import { loginSuccess, logoutSuccess } from "../redux/authSlice";
import { createAxiosJwt, post } from "../utils/axiosAPI";
import { path } from "../utils/axiosAPI";
import { updateUser } from "../redux/userSlice";
import jwtDecode from "jwt-decode";

export const login = async ({ username, password }, dispatch) => {
  try {

    const res = await post(path.login, { username, password });

    // console.log("res - login", res);
    if (res.success) {
      dispatch(loginSuccess(res.data));
      getUser(res.data.accessToken, res.data.refreshToken, dispatch);
    }
    // handleShowLogin();

  } catch (error) {
    console.log("err ", error);
    return error.response.data.message;
    // return "test";
    // setErrorMessage(error.response.data.message);
  }
}

export const logout = async (accessToken, refreshToken, dispatch) => {
  const axiosJwt = createAxiosJwt(accessToken, refreshToken, dispatch);
  try {
    const res = await axiosJwt.patch(path.logout, {}, {
      headers: {
        Authorization: `bearer ${accessToken}`
      },
      // withCredentials: true
    })
    if (res.data.isSuccess) {
      dispatch(logoutSuccess());
      dispatch(updateUser(null));
    }
  } catch (error) {
    console.log(error);
  }
}

export const getUser = async (accessToken, refreshToken, dispatch) => {
  const date = new Date();
  const decodedRefresh = jwtDecode(refreshToken);
  if (refreshToken) {
    if (!(decodedRefresh.exp < date.getTime() / 1000)) {
      const axiosJwt = createAxiosJwt(accessToken, refreshToken, dispatch);
      try {
        const res = await axiosJwt.get(path.getUser, {
          headers: {
            Authorization: `bearer ${accessToken}`
          },
        })
        const user = res.data;
        dispatch(updateUser({
          accessTokenn: accessToken,
          refreshTokenn: refreshToken,
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          phone: user.phone,
          email: user.email,
          username: user.username,
          congtyName: user.company.name,
          congtyTotal: user.company.totalEmployee,
          congtyId: user.company._id,
          congtyPhone: user.company.phone,
          congtyType: user.company.type,
          congtyLocation: user.company.location,
          congtyAbout: user.company.about,
        }));
      } catch (error) {
        console.log("error");
        console.log(error);
      }
    }
  }
}
