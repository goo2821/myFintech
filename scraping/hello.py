from selenium import webdriver
driver = webdriver.Chrome('./chromedriver')
driver.implicitly_wait(3)
driver.get('https://search.naver.com/search.naver?where=nexearch&sm=top_hty&fbm=1&ie=utf8&query=1351+%ED%8F%89%EC%9C%BC%EB%A1%9C')